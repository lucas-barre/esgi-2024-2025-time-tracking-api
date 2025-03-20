import express from 'express';
import Project from '../models/Project.js';
const router = express.Router();

/**
 * GET /projects
 * Retourner la liste des projets
 */
router.get('/', async (req, res) => {
  const projects = await Project.find();
  res.json(projects);
});

/**
 * POST /projects
 * Créer un nouveau projet
 */
router.post('/', async (req, res) => {
  const project = new Project(req.body);
  await project.save();
  res.status(201).json(project);
});

/**
 * GET /projects/{id}
 * Retourner les données d'un projet
 */
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (project === null) {
      res.status(404).json({ message: 'Ce projet n\'existe pas' });
    } else {
      res.json(project);
    }
  } catch (error) {
    res.status(400).json({ message: 'invalid id' });
  }
});

/**
 * PUT /projects/{id}
 * Mettre à jour les données d'un projet
 */
router.put('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (project === null) {
      res.status(404).json({ message: 'Ce projet n\'existe pas' });
    } else {
      res.json(project);
    }
  } catch (error) {
    res.status(400).json({ message: 'invalid id' });
  }
});

/**
 * DELETE /projects/{id}
 * Supprimer un projet
 */
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (project === null) {
      res.status(404).json({ message: 'Ce projet n\'existe pas' });
    } else {
      res.json({ message: 'Projet supprimé avec succès' });
    }
  } catch (error) {
    res.status(400).json({ message: 'invalid id' });
  }
});

export default router;
