alter table public.video_generation_jobs
  add column if not exists idempotency_key text;

create unique index if not exists video_generation_jobs_idempotency_key_uidx
  on public.video_generation_jobs(idempotency_key)
  where idempotency_key is not null;

create index if not exists video_generation_jobs_provider_operation_idx
  on public.video_generation_jobs(provider_operation)
  where provider_operation is not null;

create or replace function public.claim_video_generation_job()
returns setof public.video_generation_jobs
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with candidate as (
    select id
    from public.video_generation_jobs
    where status = 'QUEUED'
      and attempt_count < max_attempts
    order by created_at
    for update skip locked
    limit 1
  )
  update public.video_generation_jobs j
  set status = 'SUBMITTED',
      updated_at = now()
  from candidate c
  where j.id = c.id
  returning j.*;
end;
$$;

revoke all on function public.claim_video_generation_job() from public;
grant execute on function public.claim_video_generation_job() to service_role;
