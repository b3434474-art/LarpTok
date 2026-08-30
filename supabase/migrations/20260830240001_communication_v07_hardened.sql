-- Harden v0.7 membership policies and allow group administration.
create or replace function public.is_conversation_member(p_conversation_id bigint, p_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.conversation_members where conversation_id=p_conversation_id and user_id=p_user_id); $$;
create or replace function public.is_conversation_admin(p_conversation_id bigint, p_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.conversation_members where conversation_id=p_conversation_id and user_id=p_user_id and role='admin'); $$;
drop policy if exists "users can add members to own conversations" on public.conversation_members;
create policy "users can add members to own conversations" on public.conversation_members for insert to authenticated with check (public.is_conversation_admin(conversation_id) or (user_id=auth.uid() and exists(select 1 from public.conversations c where c.id=conversation_id and c.created_by=auth.uid())));
drop policy if exists "members can view members" on public.conversation_members;
create policy "members can view members" on public.conversation_members for select to authenticated using (public.is_conversation_member(conversation_id));
drop policy if exists "members can view conversations" on public.conversations;
create policy "members can view conversations" on public.conversations for select to authenticated using (public.is_conversation_member(id));
