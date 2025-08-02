import mongoose from "mongoose";

const musicSchema = new mongoose.Schema({
  title: String,
  description: String,
  genre: String,

  
  musicFile: Buffer,
  musicFileType: String, 

  
  thumbnailFile: Buffer,
  thumbnailFileType: String,

  tokenized: Boolean,
  tokenAddress: String,
  tokenSupply: Number,
  creatorAddress: String,
  revenueSplit: Object,
  transactionHash: String,
  mintedAt: Date,
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true
  }
}, { timestamps: true });

export default mongoose.model("Music", musicSchema);





// import mongoose from "mongoose";

// const musicSchema = new mongoose.Schema({
//   title: String,
//   description: String,
//   genre: String,
//   musicFile: String,
//   thumbnail: String,
//   tokenized: Boolean,
//   tokenAddress: String,
//   tokenSupply: Number,
//   creatorAddress: String,
//   revenueSplit: Object,
//   transactionHash: String,
//   mintedAt: Date,
// }, { timestamps: true });

// export default mongoose.model("Music", musicSchema);
