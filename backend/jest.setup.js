const { sequelize } = require('./models');

afterAll(async () => {
  try {
    await sequelize.close();
  } catch (e) {
    // ignore
  }
});
