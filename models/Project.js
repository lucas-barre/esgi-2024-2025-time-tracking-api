import { Schema, model } from 'mongoose';

const projectSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  client: { type: String, required: true, default: "SelfEngaged" }
});

projectSchema.pre('validate', async function (next) {
    if (!this.slug) {
        const baseSlug = this.name.toLowerCase().replace(/[\s]+/g, '-').replace(/[^\w-]+/g, '');
        let slug = baseSlug;
        let count = 1;

        while (await model("Project").exists({ slug })) {
            slug = `${baseSlug}-${count}`;
            count++;
        }

        this.slug = slug;
    }
    next();
});

export default model("Project", projectSchema);
