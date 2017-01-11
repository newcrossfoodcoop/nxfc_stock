'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var	Schema = mongoose.Schema;

var CheckoutSchema = new Schema({
    orderId: {
        type: Schema.Types.ObjectId,
        required: 'External orderId must be provided',
        unique: true
    },
    user: { 
        _id: { type: String, required: true },
        username: { type: String, required: true },
        displayName: { type: String, required: true },
        email: { type: String, required: true }
    },
    state: {
        type: String,
        enum: ['new', 'confirmed', 'cancelled', 'finalised'],
        default: 'new'
    },
    items: [{
        name: { 
            type: String,
            required: true 
        },
        cost: { type: Number },
        price: { type: Number },
        quantity: { 
            type: Number,
            required: true 
        },
        productId: { 
            type: Schema.Types.ObjectId, 
            required: true 
        },
        supplierId: { 
            type: Schema.Types.ObjectId, 
            required: true 
        }
    }],
    pickup: {
        type: Schema.Types.ObjectId,
        ref: 'Pickup'
    },
	updated: {
		type: Date,
		default: Date.now
	},
	created: {
		type: Date,
		default: Date.now
	},
	schemaVersion: {
	    type: Number
	}
});

CheckoutSchema.set('timestamps', { updatedAt: 'updated', createdAt: 'created'});

var schemaVersion = 1;
CheckoutSchema.post('init', function() {
    var doc = this;
    
    if (doc.schemaVersion === schemaVersion) { return; }
    
    var version = doc.schemaVersion || 0;
    try {
        switch(version) {
            case 0:
                if (!doc.user._id) { doc.user._id = '1a1a1a1a1a1a1a1a1a1a0000'; }
                if (!doc.user.username) { doc.user.username = 'unknown'; }
                if (!doc.user.displayName) { doc.user.displayName = 'unknown'; }
                if (!doc.user.email) { doc.user.email = 'unknown@unknown.com'; }
                /* falls through */
            default:
                if (doc.schemaVersion !== schemaVersion) {
                    doc.schemaVersion = schemaVersion;
                }
        }
    } catch (err) {
        console.error(err);
        throw new Error('CheckoutSchema Update Error: ' + err.message);
    }

});

CheckoutSchema.pre('save', function(next) {
    var doc = this;
    
    // Set the schemaVersion for new documents only, init takes care of the rest
    if (doc.isNew) {
        doc.schemaVersion = schemaVersion;
    }
    
    next();
});

var Checkout = mongoose.model('Checkout', CheckoutSchema);
