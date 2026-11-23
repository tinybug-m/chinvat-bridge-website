-- Public read API for published content (ARCHITECTURE_DECISIONS D2, D11, D12).
--
-- The website calls these with the anon key. They are the only way anon/authenticated can reach
-- editorial data, and every one of them returns the PUBLISHED revision only: a draft, a revision under
-- review or an approved-but-unpublished revision can never reach a public response or the public cache.
--
-- plpgsql binds table references at first call, so these can be created before the SEO Automation
-- migrations create the editorial tables. They are owned by content_reader, which those migrations
-- grant SELECT on exactly the tables read here.

-- One published document (page, settings, navigation or collection) by key, or NULL.
create or replace function public.published_document(p_key text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
           'key', d.key,
           'kind', d.kind,
           'revisionId', r.id,
           'schemaVersion', r.schema_version,
           'contentHash', r.content_hash,
           'data', r.data,
           'publishedAt', d.published_at,
           'updatedOn', d.updated_on)
    into result
    from editorial.documents d
    join editorial.document_revisions r on r.id = d.published_revision_id and r.document_id = d.id
   where d.key = p_key
     and d.status = 'published';
  return result;
end;
$$;

-- Several published documents in one round trip (shared chrome: settings + navigation + collections).
create or replace function public.published_documents(p_keys text[])
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  if p_keys is null or cardinality(p_keys) > 50 then
    raise exception 'between 1 and 50 keys' using errcode = '22023';
  end if;
  select coalesce(jsonb_object_agg(d.key, jsonb_build_object(
           'key', d.key,
           'kind', d.kind,
           'revisionId', r.id,
           'schemaVersion', r.schema_version,
           'contentHash', r.content_hash,
           'data', r.data,
           'publishedAt', d.published_at,
           'updatedOn', d.updated_on)), '{}'::jsonb)
    into result
    from editorial.documents d
    join editorial.document_revisions r on r.id = d.published_revision_id and r.document_id = d.id
   where d.key = any (p_keys)
     and d.status = 'published';
  return result;
end;
$$;

-- Article summaries for lists (no body), newest first.
create or replace function public.published_articles()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  select coalesce(jsonb_agg(jsonb_build_object(
           'slug', a.live_slug,
           'title', r.title,
           'seoTitle', r.seo_title,
           'description', r.description,
           'category', r.category,
           'tags', to_jsonb(r.tags),
           'author', r.author,
           'relatedServices', r.related_services,
           'readingMinutes', r.reading_minutes,
           'wordCount', r.word_count,
           'firstPublishedOn', a.first_published_on,
           'updatedOn', a.updated_on,
           'revisionId', r.id)
         -- Same-day articles keep the editorial API's order (oldest id first).
         order by a.first_published_on desc, a.id asc), '[]'::jsonb)
    into result
    from editorial.articles a
    join editorial.revisions r on r.id = a.published_revision_id and r.article_id = a.id
   where a.status = 'published';
  return result;
end;
$$;

-- One published article with its body, by its live slug, or NULL.
create or replace function public.published_article(p_slug text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
           'slug', a.live_slug,
           'title', r.title,
           'seoTitle', r.seo_title,
           'description', r.description,
           'category', r.category,
           'tags', to_jsonb(r.tags),
           'author', r.author,
           'relatedServices', r.related_services,
           'readingMinutes', r.reading_minutes,
           'wordCount', r.word_count,
           'firstPublishedOn', a.first_published_on,
           'updatedOn', a.updated_on,
           'revisionId', r.id,
           'schemaVersion', r.schema_version,
           'contentHash', r.content_hash,
           'content', r.content)
    into result
    from editorial.articles a
    join editorial.revisions r on r.id = a.published_revision_id and r.article_id = a.id
   where a.live_slug = p_slug
     and a.status = 'published';
  return result;
end;
$$;

-- The current live slug for an old slug of a still-published article (permanent redirect), or NULL.
create or replace function public.article_redirect(p_slug text)
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  target text;
begin
  select a.live_slug
    into target
    from editorial.slug_redirects s
    join editorial.articles a on a.id = s.article_id
   where s.from_slug = p_slug
     and a.status = 'published'
     and a.live_slug is not null
     and a.live_slug <> p_slug;
  return target;
end;
$$;

-- Everything the sitemap lists: published pages and published articles, with lastmod dates.
create or replace function public.sitemap_entries()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  select coalesce(jsonb_agg(e order by e->>'path'), '[]'::jsonb)
    into result
    from (
      select jsonb_build_object(
               'kind', 'page',
               'path', substr(d.key, 6),
               -- Only a date the page itself declares; no invented lastmod for undated pages.
               'lastModified', d.updated_on) as e
        from editorial.documents d
       where d.kind = 'page' and d.status = 'published' and d.key like 'page:/%'
         and coalesce((select (r.data #>> '{seo,robots}') from editorial.document_revisions r
                        where r.id = d.published_revision_id), 'index') not like 'noindex%'
      union all
      select jsonb_build_object(
               'kind', 'article',
               'path', '/insights/' || a.live_slug,
               'lastModified', coalesce(a.updated_on, a.first_published_on))
        from editorial.articles a
       where a.status = 'published' and a.live_slug is not null
    ) entries;
  return result;
end;
$$;

do $$
declare
  fn text;
begin
  -- A new function owner needs CREATE on the schema at the moment of the change (non-superuser).
  grant create on schema public to content_reader;
  foreach fn in array array[
    'public.published_document(text)',
    'public.published_documents(text[])',
    'public.published_articles()',
    'public.published_article(text)',
    'public.article_redirect(text)',
    'public.sitemap_entries()'
  ] loop
    execute format('alter function %s owner to content_reader', fn);
    execute format('revoke all on function %s from public', fn);
    execute format('grant execute on function %s to anon, authenticated, service_role', fn);
  end loop;
  revoke create on schema public from content_reader;
end
$$;
