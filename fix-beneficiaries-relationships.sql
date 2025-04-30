-- Add explicit foreign key constraints for beneficiaries to profiles
ALTER TABLE beneficiaries 
DROP CONSTRAINT IF EXISTS beneficiaries_user_id_fkey,
DROP CONSTRAINT IF EXISTS beneficiaries_beneficiary_id_fkey;

ALTER TABLE beneficiaries
ADD CONSTRAINT beneficiaries_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id),
ADD CONSTRAINT beneficiaries_beneficiary_id_fkey
FOREIGN KEY (beneficiary_id) REFERENCES profiles(id);
