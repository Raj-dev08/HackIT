export const serviceHandler = async (req,res,next) => {
    try {
        const originalJson = res.json.bind(res);//saving the real function
        res.json = (body) => {
            if (body && typeof body === 'object') {
            body.service = "message"; 
            }
            return originalJson(body);//using real function for no possible issues
        };
        next();
    } catch (error) {
        next(error)
    }
}
