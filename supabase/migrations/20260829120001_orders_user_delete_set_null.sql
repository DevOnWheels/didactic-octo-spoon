-- Admins können jetzt Nutzerkonten löschen (siehe admin-users Edge Function). Ohne diese Änderung
-- würde das Löschen eines Nutzers mit bestehenden Bestellungen an der Fremdschlüssel-Constraint
-- scheitern. Bestellungen bleiben als Beleg erhalten, nur die Zuordnung zum Konto entfällt —
-- entspricht dem bereits bestehenden Verhalten bei Gast-Bestellungen (user_id ist dort auch null).
alter table public.orders
  drop constraint orders_user_id_fkey,
  add constraint orders_user_id_fkey foreign key (user_id) references auth.users (id) on delete set null;
