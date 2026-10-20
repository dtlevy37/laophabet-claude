-- Demographics collected at onboarding. Existing profiles.region now holds free
-- text detail when lao_locale = 'other'.
alter table public.profiles
  add column gender text
    check (gender in ('female','male','other','undisclosed')),
  add column age_range text
    check (age_range in ('18-24','25-34','35-44','45-54','55-64','65+')),
  add column lao_locale text
    check (lao_locale in ('vientiane','other')),
  add column english_level text           -- self-reported; decides whether the English hint is offered
    check (english_level in ('none','some','good'));
