-- Add explicit foreign key constraints for transactions to profiles
ALTER TABLE transactions 
DROP CONSTRAINT IF EXISTS transactions_sender_id_fkey,
DROP CONSTRAINT IF EXISTS transactions_recipient_id_fkey;

ALTER TABLE transactions
ADD CONSTRAINT transactions_sender_id_fkey
FOREIGN KEY (sender_id) REFERENCES profiles(id),
ADD CONSTRAINT transactions_recipient_id_fkey
FOREIGN KEY (recipient_id) REFERENCES profiles(id);
