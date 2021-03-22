const {db} = require('./server');

const seed = async () => {
  await db.sync({ force: true });
};

seed();