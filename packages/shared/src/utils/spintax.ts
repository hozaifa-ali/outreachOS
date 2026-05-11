/** Processes spintax strings like {Hi|Hello|Hey} into a random variant */
export function processSpintax(text: string): string {
  return text.replace(/\{([^{}]+)\}/g, (_, group: string) => {
    const options = group.split('|');
    return options[Math.floor(Math.random() * options.length)] ?? group;
  });
}

/** Replaces template variables like {{first_name}} with contact data */
export function renderTemplate(template: string, variables: Record<string, string | undefined>): string {
  let result = processSpintax(template);
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value ?? '');
  }
  return result;
}
