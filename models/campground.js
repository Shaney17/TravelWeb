var mongoose = require("mongoose");

var campSchema = ({
    name: String, 
    image: String,
    price: String,
    description: String,
    guestImg:Array,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});
module.exports = mongoose.model("campgrounds", campSchema);