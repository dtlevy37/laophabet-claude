-- Curriculum tables: mirror of Z:\dev\laophabetv2\data\*.csv.
-- Loaded by backend/scripts/generate_seed.py output (idempotent upserts).
-- Native speakers never read these directly; they go through the RPCs in
-- 20261010000200_review_functions.sql.

create table public.templates (
  template_id        text primary key,
  lao_pattern        text,
  english_pattern    text,
  slot_names         text,          -- pipe-separated
  intro_order        integer,
  requires_word_ids  text,          -- pipe-separated word ids
  source             text,
  confidence         text,
  notes              text
);

create table public.words (
  word_id               text primary key,
  lao                   text not null,
  ipa                   text,
  respelling            text,
  syllables             text,       -- pipe-separated
  tone_by_syllable      text,       -- pipe-separated
  tone_derivation       text,
  pos                   text,
  classifier_word_id    text,       -- soft reference to words.word_id (no FK: load order)
  classifier_type       text,
  classifier_confidence text,
  component_word_ids    text,       -- pipe-separated
  gloss_en              text,
  freq_rank             integer,
  topic                 text,
  tier                  text,        -- "30","100",... or "extra"
  intro_order           integer,
  new_letter_ids        text,       -- pipe-separated
  new_vowel_ids         text,       -- pipe-separated
  pron_tip              text,
  source                text,
  confidence            text,
  notes                 text
);
create index words_topic_idx on public.words (topic);

create table public.letters (
  letter_id         text primary key,
  lao               text not null,
  unicode           text,
  kind              text,
  name_lao          text,
  name_gloss_en     text,
  ipa_initial       text,
  ipa_final         text,
  consonant_class   text,
  romanization_bgn  text,
  respelling        text,
  pron_tip          text,
  coverage_required text,       -- yes | reading-only
  intro_word_id     text,
  source            text,
  confidence        text,
  notes             text
);

create table public.vowels (
  vowel_id          text primary key,
  lao_pattern       text not null,
  form              text,
  length            text,
  sound_group       text,
  ipa               text,
  romanization_bgn  text,
  respelling        text,
  pron_tip          text,
  coverage_required text,       -- yes | reading-only
  intro_word_id     text,
  source            text,
  confidence        text,
  notes             text
);

create table public.sentences (
  sentence_id    text primary key,
  lao            text not null,
  lao_spaced     text,
  ipa            text,
  respelling     text,
  english        text,
  target_word_id text references public.words (word_id),
  template_id    text references public.templates (template_id),
  source         text,
  confidence     text,
  notes          text,
  word_overrides text
);
create index sentences_target_word_idx on public.sentences (target_word_id);

create table public.sentence_words (
  sentence_id text not null references public.sentences (sentence_id) on delete cascade,
  position    integer not null,
  word_id     text not null references public.words (word_id),
  source      text,
  confidence  text,
  notes       text,
  primary key (sentence_id, position)
);
create index sentence_words_word_idx on public.sentence_words (word_id);

create table public.template_fillers (
  template_id text not null references public.templates (template_id),
  slot_name   text not null,
  word_id     text not null references public.words (word_id),
  source      text,
  confidence  text,
  notes       text,
  primary key (template_id, slot_name, word_id)
);

create table public.tone_exceptions (
  word_id   text not null references public.words (word_id),
  syl_index integer not null,
  tone      text,
  source    text,
  note      text,
  primary key (word_id, syl_index)
);

create table public.learning_order (
  step       integer primary key,
  item_type  text not null,
  item_id    text not null,
  why        text,
  source     text,
  confidence text,
  notes      text
);
create index learning_order_item_idx on public.learning_order (item_type, item_id);

-- Curriculum is service-role / postgres only. RLS on + no policies = deny for
-- anon and authenticated; the revoke is belt and braces.
do $$
declare t text;
begin
  foreach t in array array['templates','words','letters','vowels','sentences',
                           'sentence_words','template_fillers','tone_exceptions','learning_order']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop;
end $$;
