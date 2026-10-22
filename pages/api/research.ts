import { handleApi } from '../../server/http';
export const config = { api: { bodyParser: { sizeLimit: '200kb' } }, maxDuration: 60 };
export default handleApi;
