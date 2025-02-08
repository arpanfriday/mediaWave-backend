const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const SubscriptionSchema = new Schema(
    {
        subscriber: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        channel: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Subscription = mongoose.model("Subscription", SubscriptionSchema);
