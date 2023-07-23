

module.exports = {
    viewBlogImage: (req, res) => {
        try {
            const { filename } = req.params

            const filePath = 'Public/Blog/' + filename

            res.status(200).sendfile(filePath)
        } catch (err) {
            res.status(400).send(err)
        }
    },
    viewUserImage: (req, res) => {
        try {
            const { filename } = req.params

            const filePath = 'Public/Avatar/' + filename

            res.status(200).sendfile(filePath)
        } catch (err) {
            res.status(400).send(err)
        }
    }
}