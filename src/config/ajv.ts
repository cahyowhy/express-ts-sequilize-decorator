import Ajv from 'ajv';

export default new Ajv()
  .addFormat('date-time', (dateTimeString) => !Number.isNaN(Date.parse(dateTimeString)));
