const mongoose = require('mongoose')

const storySchema = new mongoose.Schema({
    description : {
        type: String,
        required: true
    },
    
 name : {
     type: String,
     require: true
 },

 code : {
    type: String,
    require: true
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

storySchema.virtual('coverImagePath').get(function() {
    if (this.coverImage != null && this.coverImageType != null) {
      return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`
    }
  })

module.exports = mongoose.model('story',storySchema)