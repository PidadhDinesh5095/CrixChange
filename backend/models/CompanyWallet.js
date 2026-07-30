import mongoose from 'mongoose'

const companyWalletSchema = new mongoose.Schema(
  {
    currency: { type: String, required: true, unique: true, default: 'INR' },
    balance: { type: Number, required: true, default: 0 },
    totalCommissionEarned: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
)

// Mirrors the `credit` pattern already used on the user Wallet model.
companyWalletSchema.methods.credit = async function (amount, description) {
  if (amount <= 0) return this
  this.balance += amount
  this.totalCommissionEarned += amount
  await this.save()
  return this
}

export default mongoose.model('CompanyWallet', companyWalletSchema)