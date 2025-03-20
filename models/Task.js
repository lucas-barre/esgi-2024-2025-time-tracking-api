import { Schema, model } from 'mongoose';

const taskSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true }
});

taskSchema.pre('validate', async function (next) {
    if (!this.slug) {
        const baseSlug = this.name.toLowerCase().replace(/[\s]+/g, '-').replace(/[^\w-]+/g, '');
        let slug = baseSlug;
        let count = 1;

        while (await model("Task").exists({ project: this.project, slug })) {
            slug = `${baseSlug}-${count}`;
            count++;
        }

        this.slug = slug;
    }
    next();
});

export default model("Task", taskSchema);
