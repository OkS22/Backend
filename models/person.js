const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const noteSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: [true, 'Name is required']
  },
  number: {
    type: String,
    minLength: 8,
    validate: {
      validator: function(v) {
        const len2 = (v.length-3).toString()
        const len3 = (v.length-4).toString()
        const regex2 = new RegExp(`\\d{2}-\\d{${len2}}`)
        const regex3 = new RegExp(`\\d{3}-\\d{${len3}}`)
        return regex2.test(v)||regex3.test(v)
      },
      message: props => `${props.value} is not a valid phone number! Use xxx-x... or xx-x...`
    },
    required: [true, 'Phone number required']
  }
})

noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', noteSchema)