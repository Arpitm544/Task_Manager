const mongoose = require('mongoose');

const automationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    trigger: {
        type: String,
        enum: ['task_created', 'task_completed', 'due_date_approaching', 'status_changed'],
        required: true
    },
    conditions: {
        type: Object,
        default: {}
    },
    actions: {
        type: Array,
        required: true,
        validate: [
            {
                validator: function(actions) {
                    return actions.length > 0;
                },
                message: 'At least one action is required'
            }
        ]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
});

const Automation = mongoose.model('Automation', automationSchema);
module.exports = Automation; 