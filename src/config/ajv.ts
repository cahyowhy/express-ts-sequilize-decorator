import Ajv from 'ajv';

const ajv = new Ajv();
ajv.addFormat('date-time', (dateTimeString) => !Number.isNaN(Date.parse(dateTimeString)));

export default ajv;
