-- Library Learn: 비밀번호 로그인과 학번 프로필

alter table public.profiles
  add column if not exists student_id text;

create unique index if not exists profiles_student_id_unique
  on public.profiles (student_id)
  where student_id is not null;
