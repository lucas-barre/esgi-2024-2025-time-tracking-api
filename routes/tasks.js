import express from 'express';
import passport from "passport";
import Task from '../models/Task.js';
import Project from '../models/Project.js';

const router = express.Router();

/**
 * GET /projects/{slug}/tasks
 * Retourner la liste paginée des tâches d’un projet
 */
router.get('/:slug/tasks', passport.authenticate('jwt', { session: false }), async (req, res) => {
    // #swagger.tags = ['Tasks']
    // #swagger.summary = 'Lister les tâches d’un projet avec pagination'
    // #swagger.parameters['page'] = { description: 'Numéro de la page', in: 'query', required: false, schema: { type: 'integer', default: 1 } }
    // #swagger.parameters['limit'] = { description: 'Nombre d’éléments par page', in: 'query', required: false, schema: { type: 'integer', default: 10 } }
    try {
        let { page = 1, limit = 10 } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);

        const project = await Project.findOne({ slug: req.params.slug });

        if (!project) {
            return res.status(404).json({ message: 'Projet introuvable' });
        }

        const totalTasks = await Task.countDocuments({ project: project._id });
        const tasks = await Task.find({ project: project._id })
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({
            totalItems: totalTasks,
            totalPages: Math.ceil(totalTasks / limit),
            currentPage: page,
            tasks
        });
    } catch (error) {
        res.status(400).json({ message: 'Erreur lors de la récupération des tâches' });
    }
});

/**
 * POST /projects/{slug}/tasks
 * Ajouter une tâche à un projet
 */
router.post('/:slug/tasks', passport.authenticate('jwt', { session: false }), async (req, res) => {
    // #swagger.tags = ['Tasks']
    // #swagger.summary = 'Créer une tâche pour un projet'
    // #swagger.parameters['slug'] = { description: 'Slug du projet' }
    // #swagger.requestBody = { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/TaskCreate" } } } }
    // #swagger.responses[201] = { description: 'Tâche créée', schema: { $ref: "#/components/schemas/Task" } }
    try {
        const project = await Project.findOne({ slug: req.params.slug });

        if (!project) {
            return res.status(404).json({ message: 'Projet introuvable' });
        }

        if (!project.user.equals(req.user._id)) {
            return res.status(403).json({ message: 'Vous n\'avez pas les droits !' });
        }

        const task = new Task({
            ...req.body,
            user: req.user._id,
            project: project._id
        });

        await task.save();
        project.tasks.push(task._id);
        await project.save();

        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ message: 'Erreur lors de la création de la tâche' });
    }
});

/**
 * GET /projects/{slug}/tasks/{taskSlug}
 * Retourner une tâche spécifique
 */
router.get('/:slug/tasks/:taskSlug', passport.authenticate('jwt', { session: false }), async (req, res) => {
    // #swagger.tags = ['Tasks']
    // #swagger.summary = 'Obtenir les détails d’une tâche'
    // #swagger.parameters['slug'] = { description: 'Slug du projet' }
    // #swagger.parameters['taskSlug'] = { description: 'Slug de la tâche' }
    // #swagger.responses[200] = { description: 'Tâche trouvée', schema: { $ref: "#/components/schemas/Task" } }
    try {
        const project = await Project.findOne({ slug: req.params.slug });

        if (!project) {
            return res.status(404).json({ message: 'Projet introuvable' });
        }

        const task = await Task.findOne({ project: project._id, slug: req.params.taskSlug });

        if (!task) {
            return res.status(404).json({ message: 'Tâche introuvable' });
        }

        res.json(task);
    } catch (error) {
        res.status(400).json({ message: 'Slug invalide' });
    }
});

/**
 * PUT /projects/{slug}/tasks/{taskSlug}
 * Modifier une tâche spécifique d'un projet
 */
router.put('/:slug/tasks/:taskSlug', passport.authenticate('jwt', { session: false }), async (req, res) => {
    // #swagger.tags = ['Tasks']
    // #swagger.summary = 'Mettre à jour une tâche d’un projet'
    // #swagger.parameters['slug'] = { description: 'Slug du projet' }
    // #swagger.parameters['taskSlug'] = { description: 'Slug de la tâche' }
    // #swagger.requestBody = { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/TaskUpdate" } } } }
    // #swagger.responses[200] = { description: 'Tâche mise à jour', schema: { $ref: "#/components/schemas/Task" } }
    try {
        const project = await Project.findOne({ slug: req.params.slug });

        if (!project) {
            return res.status(404).json({ message: 'Projet introuvable' });
        }

        const task = await Task.findOneAndUpdate(
            { project: project._id, slug: req.params.taskSlug },
            req.body,
            { new: true }
        );

        if (!task) {
            return res.status(404).json({ message: 'Tâche introuvable' });
        }

        res.json(task);
    } catch (error) {
        res.status(400).json({ message: 'Slug invalide' });
    }
});

/**
 * DELETE /projects/{slug}/tasks/{taskSlug}
 * Supprimer une tâche
 */
router.delete('/:slug/tasks/:taskSlug', passport.authenticate('jwt', { session: false }), async (req, res) => {
    // #swagger.tags = ['Tasks']
    // #swagger.summary = 'Supprimer une tâche'
    // #swagger.parameters['slug'] = { description: 'Slug du projet' }
    // #swagger.parameters['taskSlug'] = { description: 'Slug de la tâche' }
    // #swagger.responses[200] = { description: 'Tâche supprimée avec succès' }
    try {
        const project = await Project.findOne({ slug: req.params.slug });

        if (!project) {
            return res.status(404).json({ message: 'Projet introuvable' });
        }

        const task = await Task.findOneAndDelete({ project: project._id, slug: req.params.taskSlug });

        if (!task) {
            return res.status(404).json({ message: 'Tâche introuvable' });
        }

        res.json({ message: 'Tâche supprimée avec succès' });
    } catch (error) {
        res.status(400).json({ message: 'Slug invalide' });
    }
});

export default router;
