import express from 'express';
import passport from "passport";
import Project from '../models/Project.js';

const router = express.Router();

/**
 * GET /projects
 * Retourner la liste paginée des projets
 */
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  // #swagger.tags = ['Projects']
  // #swagger.summary = 'Lister les projets avec pagination'
  // #swagger.parameters['page'] = { description: 'Numéro de la page', in: 'query', required: false, schema: { type: 'integer', default: 1 } }
  // #swagger.parameters['limit'] = { description: 'Nombre d’éléments par page', in: 'query', required: false, schema: { type: 'integer', default: 10 } }
  try {
      let { page = 1, limit = 10 } = req.query;

      page = parseInt(page);
      limit = parseInt(limit);

      const totalProjects = await Project.countDocuments({ user: req.user._id });
      const projects = await Project.find({ user: req.user._id })
          .populate({ path: "tasks", select: "name slug" })
          .skip((page - 1) * limit)
          .limit(limit);
          
      res.json({
          totalItems: totalProjects,
          totalPages: Math.ceil(totalProjects / limit),
          currentPage: page,
          projects
      });
  } catch (error) {
      res.status(400).json({ message: 'Erreur lors de la récupération des projets' });
  }
});

/**
 * POST /projects
 * Créer un nouveau projet
 */
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  // #swagger.tags = ['Projects']
  // #swagger.summary = 'Créer un projet'
  // #swagger.requestBody = { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ProjectCreate" } } } }
  // #swagger.responses[201] = { description: 'Projet créé', schema: { $ref: "#/components/schemas/Project" } }
  const project = new Project({ ...req.body, user: req.user._id });

  await project.save();
  res.status(201).json(project);
});

/**
 * GET /projects/{slug}
 * Retourner les données d'un projet
 */
router.get('/:slug', passport.authenticate('jwt', { session: false }), async (req, res) => {
  // #swagger.tags = ['Projects']
  // #swagger.summary = 'Obtenir les détails d’un projet'
  // #swagger.parameters['slug'] = { description: 'Slug du projet' }
  // #swagger.responses[200] = { description: 'Projet trouvé', schema: { $ref: "#/components/schemas/Project" } }
  try {
    const project = await Project.findOne({ slug: req.params.slug });
    if (!project) {
      res.status(404).json({ message: 'Ce projet n\'existe pas' });
    } else {
      res.json(project);
    }
  } catch (error) {
    res.status(400).json({ message: 'Slug invalide' });
  }
});

/**
 * PUT /projects/{slug}
 * Mettre à jour un projet
 */
router.put('/:slug', passport.authenticate('jwt', { session: false }), async (req, res) => {
  // #swagger.tags = ['Projects']
  // #swagger.summary = 'Mettre à jour un projet'
  // #swagger.parameters['slug'] = { description: 'Slug du projet' }
  // #swagger.requestBody = { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ProjectUpdate" } } } }
  // #swagger.responses[200] = { description: 'Projet mis à jour', schema: { $ref: "#/components/schemas/Project" } }
  try {
      const project = await Project.findOneAndUpdate({ slug: req.params.slug }, req.body, { new: true });

      if (!project) {
          return res.status(404).json({ message: 'Projet introuvable' });
      }

      res.json(project);
  } catch (error) {
      res.status(400).json({ message: 'Slug invalide' });
  }
});

/**
 * DELETE /projects/{slug}
 * Supprimer un projet
 */
router.delete('/:slug', passport.authenticate('jwt', { session: false }), async (req, res) => {
  // #swagger.tags = ['Projects']
  // #swagger.summary = 'Supprimer un projet'
  // #swagger.parameters['slug'] = { description: 'Slug du projet' }
  // #swagger.responses[200] = { description: 'Projet supprimé avec succès' }
  try {
    const project = await Project.findOneAndDelete({ slug: req.params.slug });
    if (!project) {
      res.status(404).json({ message: 'Ce projet n\'existe pas' });
    } else {
      res.json({ message: 'Projet supprimé avec succès' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Slug invalide' });
  }
});

export default router;
