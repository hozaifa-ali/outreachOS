"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Search, Filter, Mail, Phone, Linkedin, MoreVertical, Upload } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ContactsPage() {
  const { data: response, isLoading } = useQuery({
    queryKey: ["contacts"],
    queryFn: () => apiFetch<any>("/contacts?pageSize=20"),
  });

  const contacts = response?.data || [];

  return (
    <div className="space-y-8 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Contacts</h1>
          <p className="text-slate-400">Manage your leads and prospect database.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link href="/contacts/import" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full bg-[#0a0a0f]/80 backdrop-blur-md border-white/10 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl">
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
          </Link>
          <Button className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-white rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all hover:scale-105 active:scale-95">
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search contacts..." 
            className="w-full pl-10 pr-4 py-2.5 bg-[#0a0a0f]/80 backdrop-blur-md border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-xl"
          />
        </div>
        <Button variant="outline" className="w-full sm:w-auto bg-[#0a0a0f]/80 backdrop-blur-md border-white/10 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      <Card className="flex-1 flex flex-col bg-[#0a0a0f]/80 backdrop-blur-md border-white/5 shadow-2xl overflow-hidden rounded-2xl min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 border-b border-white/5 animate-pulse bg-white/5" />
            ))}
          </div>
        ) : contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-16 px-4 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No contacts found</h3>
            <p className="text-slate-400 max-w-md mb-8">Import a CSV or add contacts manually to build your audience.</p>
            <Link href="/contacts/import">
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                Import Contacts
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Company</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Contact Info</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Status</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {contacts.map((contact: any, i: number) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    key={contact.id} className="hover:bg-white/5 transition-colors group cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/20 text-primary font-medium text-sm shadow-sm group-hover:shadow-[0_0_10px_rgba(99,102,241,0.3)] transition-shadow">
                          {contact.firstName?.[0]}{contact.lastName?.[0] || contact.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white group-hover:text-primary transition-colors">
                            {contact.firstName} {contact.lastName}
                          </p>
                          <p className="text-xs text-slate-500 block sm:hidden">{contact.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-slate-300 font-medium">{contact.company || "-"}</p>
                      <p className="text-xs text-slate-500">{contact.title}</p>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{contact.email}</span>
                      </div>
                      {contact.linkedinUrl && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <Linkedin className="w-3.5 h-3.5" />
                          <span>LinkedIn</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                        contact.status === "active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        contact.status === "bounced" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                        "bg-white/5 text-slate-400 border border-white/10"
                      }`}>
                        {contact.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="p-2 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
