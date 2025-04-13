import CollabService from '../service/CollabService.js';

async function getCollab(req, res) {
  try {
    const { userId } = req.query;
    const collab = await CollabService.getCollab(userId);
    return res.status(200).json({ message: `Retrieved collab: ${JSON.stringify(collab)}`, data: { collab } });
  } catch (err) {
    console.log('Error encountered while retrieving collab: ', err);
    return res.status(500).json({ message: err.message });
  }
}

export default { getCollab };
