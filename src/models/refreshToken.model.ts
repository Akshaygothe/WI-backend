/** @format */

import mongoose, { Schema } from "mongoose";

export interface IRefreshToken extends mongoose.Document {
  token: string;
  user: mongoose.Types.ObjectId;
  revoked: boolean;
  createdAt: Date;
  expiresAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    token: {
      type: String,
      required: true,
      index: {
        unique: true,
      },
    },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },
    revoked: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: {
        expires: 0,
      },
    },
  },
  { timestamps: true },
);

export const RefreshToken = mongoose.model<IRefreshToken>(
  "RefreshToken",
  refreshTokenSchema,
);
