import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const myCompaniesQuery = () =>
  queryOptions({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("company_members")
        .select("member_role, companies(id, name, is_sample, created_at)")
        .eq("user_id", u.user?.id ?? "");
      if (error) throw error;
      return (data ?? [])
        .filter((m) => m.companies)
        .map((m) => ({ ...(m.companies as { id: string; name: string; is_sample: boolean; created_at: string }), member_role: m.member_role }));
    },
  });

export const myInvitesQuery = () =>
  queryOptions({
    queryKey: ["invites", "mine"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const email = u.user?.email ?? "";
      const { data, error } = await supabase
        .from("invites")
        .select("id, company_id, email, accepted, companies(name)")
        .ilike("email", email)
        .eq("accepted", false);
      if (error) throw error;
      return data ?? [];
    },
  });

export const companyOverviewQuery = (companyId: string) =>
  queryOptions({
    queryKey: ["company", companyId],
    queryFn: async () => {
      const [depts, roles, items, inputs, changes, invites] = await Promise.all([
        supabase.from("departments").select("id, name").eq("company_id", companyId).order("created_at"),
        supabase.from("roles").select("id, title, holder_name, successor_name, status, department_id").eq("company_id", companyId).order("created_at"),
        supabase.from("knowledge_items").select("role_id, kind, source_input_id").eq("company_id", companyId).eq("status", "active"),
        supabase.from("inputs").select("role_id, created_at").eq("company_id", companyId),
        supabase.from("change_requests").select("role_id").eq("company_id", companyId).eq("status", "pending"),
        supabase.from("invites").select("id, email, accepted, role_id").eq("company_id", companyId).order("created_at", { ascending: false }),
      ]);
      for (const r of [depts, roles, items, inputs, changes, invites]) if (r.error) throw r.error;
      return {
        departments: depts.data ?? [],
        roles: roles.data ?? [],
        items: items.data ?? [],
        inputs: inputs.data ?? [],
        changes: changes.data ?? [],
        invites: invites.data ?? [],
      };
    },
  });

export const roleQuery = (roleId: string) =>
  queryOptions({
    queryKey: ["role", roleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roles")
        .select("*, departments(name), companies(name, is_sample)")
        .eq("id", roleId)
        .single();
      if (error) throw error;
      return data;
    },
  });

export const roleItemsQuery = (roleId: string) =>
  queryOptions({
    queryKey: ["role", roleId, "items"],
    queryFn: async () => {
      const [items, links] = await Promise.all([
        supabase.from("knowledge_items").select("*").eq("role_id", roleId).eq("status", "active").order("created_at"),
        supabase.from("knowledge_links").select("from_item, to_item").eq("role_id", roleId),
      ]);
      if (items.error) throw items.error;
      return { items: items.data ?? [], links: links.data ?? [] };
    },
  });

export const roleInputsQuery = (roleId: string) =>
  queryOptions({
    queryKey: ["role", roleId, "inputs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("inputs").select("*").eq("role_id", roleId).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

export const roleChangesQuery = (roleId: string) =>
  queryOptions({
    queryKey: ["role", roleId, "changes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("change_requests")
        .select("*, knowledge_items(title, body)")
        .eq("role_id", roleId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

import type { Database } from "@/integrations/supabase/types";
export type KnowledgeItem = Database["public"]["Tables"]["knowledge_items"]["Row"];
export type InputRow = Database["public"]["Tables"]["inputs"]["Row"];
