const express = require('express');
const authMiddleware = require('../middlewares/auth')

const Project = require('../models/project');
const Task = require('../models/task');

const router = express.Router();

router.use(authMiddleware);

//list
router.get('/', async (req, res) =>{
    try {
        const projects = await Project.find().populate(['user', 'tasks']);
        return res.send({ projects });
    } catch (error) {
        res.status(400).send({error: 'Error getting projects\' list'});
    }
});

// get project by id
router.get('/:projectId', async (req, res) => {
    try {
        const project = await  Project.findById(req.params.projectId).populate(['user','tasks']);
        return res.send({ project });
    } catch (error) {
        res.status(400).send({error: 'Error returning project'});
    }
});

//create
router.post('/', async (req, res) => {
    try {
        const { title, description, tasks } = req.body;

        const project = await Project.create({ title, description, user: req.userId });

        await Promise.all(tasks.map( async task => {
            const projectTask = new Task({ ...task, project: project._id });
  
            await projectTask.save();

            project.tasks.push(projectTask);


        }));

        await project.save();

        return res.send({ project });
        
    } catch (error) {
        return res.status(400).send({ error: 'Error creating new project' });        
    }

});

router.put('/:projectId', async (req, res) => {
    try {
        const { title, description, tasks } = req.body;

        const project = await Project.findByIdAndUpdate(req.params.projectId,{ 
            title, 
            description }, {new: true });
            
        project.tasks = [];

        await Task.deleteMany({project: project._id});

        await Promise.all(tasks.map(async task => {
            const projectTask = new Task({ ...task, project: project._id });

            await projectTask.save();

            project.tasks.push(projectTask);


        }));

        await project.save();

        return res.send({ project });

    } catch (error) {
        return res.status(400).send({ error: 'Error creating new project' });
    }
});

// delete project by id
router.delete('/:projectId', async (req, res) => {
    try {
        await Project.findByIdAndRemove(req.params.projectId);
        res.send();
    } catch (error) {
        res.status(400).send({ error: 'Error deleting project' });
    }
});


module.exports = app => app.use('/projects', router);

