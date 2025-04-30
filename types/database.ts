export interface User {
  id: string
  email: string
  password: string
  created_at: string
}

export interface Profile {
  id: string
  account_number: string
  balance: number
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  sender_id: string
  recipient_id: string
  amount: number
  note: string | null
  created_at: string
  sender?: { account_number: string }
  recipient?: { account_number: string }
}

export interface Beneficiary {
  id: string
  user_id: string
  beneficiary_id: string
  created_at: string
  profiles?: { account_number: string }
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, "created_at"> & { created_at?: string }
        Update: Partial<User>
      }
      profiles: {
        Row: Profile
        Insert: Omit<Profile, "created_at" | "updated_at"> & { created_at?: string; updated_at?: string }
        Update: Partial<Profile>
      }
      transactions: {
        Row: Transaction
        Insert: Omit<Transaction, "id" | "created_at"> & { created_at?: string }
        Update: Partial<Transaction>
      }
      beneficiaries: {
        Row: Beneficiary
        Insert: Omit<Beneficiary, "id" | "created_at"> & { created_at?: string }
        Update: Partial<Beneficiary>
      }
    }
  }
}
