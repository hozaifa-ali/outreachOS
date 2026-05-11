import type { FastifyInstance } from 'fastify';
import { prisma } from '@outreachos/db';
import { createContactSchema, updateContactSchema, createContactListSchema, contactQuerySchema, importContactsSchema } from '@outreachos/shared';
import { authenticate, requirePermission, type AuthenticatedRequest } from '../../shared/auth/rbac.guard';
import { AppError } from '../../shared/errors/app-error';
import Papa from 'papaparse';

export async function contactRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);

  /** GET /contacts — List contacts with filters + pagination */
  app.get('/', async (req) => {
    const { orgId } = (req as AuthenticatedRequest).user;
    const parsed = contactQuerySchema.safeParse(req.query);
    if (!parsed.success) throw AppError.badRequest('Invalid query', parsed.error.flatten());
    const { page, pageSize, search, status, listId, sortBy, sortOrder } = parsed.data;

    const where: any = { orgId };
    if (status) where.status = status;
    if (listId) where.listId = listId;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.contact.count({ where }),
    ]);

    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  });

  /** GET /contacts/:id — Get single contact */
  app.get<{ Params: { id: string } }>('/:id', async (req) => {
    const { orgId } = (req as AuthenticatedRequest).user;
    const contact = await prisma.contact.findFirst({ where: { id: req.params.id, orgId } });
    if (!contact) throw AppError.notFound('Contact not found');
    return contact;
  });

  /** POST /contacts — Create single contact */
  app.post('/', async (req, reply) => {
    const { orgId } = (req as AuthenticatedRequest).user;
    const parsed = createContactSchema.safeParse(req.body);
    if (!parsed.success) throw AppError.badRequest('Validation failed', parsed.error.flatten());

    const contact = await prisma.contact.create({ data: { ...(parsed.data as any), orgId } });
    reply.status(201).send(contact);
  });

  /** PATCH /contacts/:id — Update contact */
  app.patch<{ Params: { id: string } }>('/:id', async (req) => {
    const { orgId } = (req as AuthenticatedRequest).user;
    const parsed = updateContactSchema.safeParse(req.body);
    if (!parsed.success) throw AppError.badRequest('Validation failed', parsed.error.flatten());

    return prisma.contact.update({ where: { id: req.params.id, orgId }, data: parsed.data as any });
  });

  /** DELETE /contacts/:id — Delete contact */
  app.delete<{ Params: { id: string } }>('/:id', { preHandler: [requirePermission('data:delete')] }, async (req, reply) => {
    const { orgId } = (req as AuthenticatedRequest).user;
    await prisma.contact.delete({ where: { id: req.params.id, orgId } });
    reply.status(204).send();
  });

  // ─── Contact Lists ──────────────────────────────────────

  /** GET /contacts/lists — List all contact lists */
  app.get('/lists/all', async (req) => {
    const { orgId } = (req as AuthenticatedRequest).user;
    return prisma.contactList.findMany({ where: { orgId }, orderBy: { createdAt: 'desc' } });
  });

  /** POST /contacts/lists — Create a contact list */
  app.post('/lists', async (req, reply) => {
    const { orgId, sub } = (req as AuthenticatedRequest).user;
    const parsed = createContactListSchema.safeParse(req.body);
    if (!parsed.success) throw AppError.badRequest('Validation failed', parsed.error.flatten());

    const list = await prisma.contactList.create({
      data: { ...parsed.data, orgId, createdBy: sub },
    });
    reply.status(201).send(list);
  });

  // ─── Import ─────────────────────────────────────────────

  /** POST /contacts/import — Upload CSV/XLSX and import contacts */
  app.post('/import', { preHandler: [requirePermission('contacts:import')] }, async (req, reply) => {
    const { orgId, sub } = (req as AuthenticatedRequest).user;

    const file = await req.file();
    if (!file) throw AppError.badRequest('No file uploaded');

    const buffer = await file.toBuffer();
    const content = buffer.toString('utf-8');

    // Parse CSV
    const parseResult = Papa.parse(content, { header: true, skipEmptyLines: true, transformHeader: (h: string) => h.trim().toLowerCase() });
    if (parseResult.errors.length > 0) {
      throw AppError.badRequest('CSV parsing errors', parseResult.errors.slice(0, 10));
    }

    const rows = parseResult.data as Record<string, string>[];
    if (rows.length === 0) throw AppError.badRequest('No data rows found in file');

    // Create or use existing list
    const listName = file.filename || `Import ${new Date().toISOString()}`;
    const list = await prisma.contactList.create({
      data: { name: listName, orgId, source: 'csv_upload', createdBy: sub },
    });

    // Field mapping (auto-detect common headers)
    const fieldMap: Record<string, string> = {
      email: 'email', e_mail: 'email', 'e-mail': 'email', email_address: 'email',
      first_name: 'firstName', firstname: 'firstName', first: 'firstName', 'first name': 'firstName',
      last_name: 'lastName', lastname: 'lastName', last: 'lastName', 'last name': 'lastName',
      company: 'company', company_name: 'company', organization: 'company',
      title: 'title', job_title: 'title', position: 'title', 'job title': 'title',
      linkedin: 'linkedinUrl', linkedin_url: 'linkedinUrl', 'linkedin url': 'linkedinUrl',
      phone: 'phone', phone_number: 'phone', mobile: 'phone',
      website: 'website', url: 'website', domain: 'website',
      industry: 'industry',
    };

    let imported = 0;
    let skipped = 0;
    let errors: string[] = [];

    // Batch insert with deduplication
    const contactsToCreate: any[] = [];
    for (const row of rows) {
      const mapped: any = { orgId, listId: list.id };
      for (const [csvCol, value] of Object.entries(row)) {
        const normalizedCol = csvCol.toLowerCase().trim();
        const prismaField = fieldMap[normalizedCol];
        if (prismaField) {
          mapped[prismaField] = value?.trim() || undefined;
        }
      }

      if (!mapped.email) {
        skipped++;
        continue;
      }

      // Basic email validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mapped.email)) {
        errors.push(`Invalid email: ${mapped.email}`);
        skipped++;
        continue;
      }

      contactsToCreate.push(mapped);
    }

    // Use transaction with skipDuplicates for dedup
    if (contactsToCreate.length > 0) {
      const result = await prisma.contact.createMany({
        data: contactsToCreate,
        skipDuplicates: true,
      });
      imported = result.count;
      skipped += contactsToCreate.length - result.count;
    }

    // Update list total
    await prisma.contactList.update({
      where: { id: list.id },
      data: { total: imported },
    });

    reply.status(201).send({
      listId: list.id,
      listName: list.name,
      totalRows: rows.length,
      imported,
      skipped,
      errors: errors.slice(0, 20),
    });
  });
}
