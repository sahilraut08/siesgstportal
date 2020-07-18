const mongoose = require('mongoose')

const eventSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true
    },

    date: {
        type: Date,
        required: true
    },

    category : {
        type: String,
        required: true
    }, 

    description : {
        type: String,
        required: true
    },
    coverImage: {
        type: Buffer,
        required: true
    },
      coverImageType: {
        type: String,
        required: true
      }
 
   
});

eventSchema.virtual('coverImagePath').get(function() {
    if (this.coverImage != null && this.coverImageType != null) {
      return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`
    }
  })

module.exports = mongoose.model('event',eventSchema)