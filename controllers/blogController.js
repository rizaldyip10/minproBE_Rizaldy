const { log } = require('handlebars')
const db = require('../models')
const { sequelize } = require('../models')
const { Op, Sequelize, Transaction } = require('sequelize')
const blog = db.blog
const dbcategory = db.category
const User = db.User
const like = db.likeBlog
const keyword = db.keyword
const blogKeyword = db.blogKeyword

module.exports = {
    getAllBlog: async (req, res) => {
        try {
            const page = +req.query.page || 1
            const limit = +req.query.limit || 10
            const search = req.query.search
            const catId = +req.query.catId 
            const sort = req.query.sort || 'DESC'
            const sortBy = req.query.sortBy || `createdAt`
            const condition = { isDeleted: false }

            if (search) {
                condition[Op.or] = [{
                    title: {
                        [Op.like]: `%${search}%`,
                    },
                }]
            }
            if (catId) {
                condition.categoryId = catId
            }

            const result = await blog.findAll({
                attributes: [
                    "id",
                    "title",
                    "content",
                    "imgBlog",
                    "country",
                    "videoURL",
                    [
                      Sequelize.literal(
                        "(SELECT COUNT(*) FROM likeBlogs WHERE likeBlogs.blogId = blog.id)"
                      ),
                      "totalLike",
                    ],
                    "createdAt",
                    "CategoryId",
                    "UserId",
                  ],
                limit,
                offset: limit * (page - 1),
                include: [
                    { model: User, attributes: ['username', 'imageProfile'] },
                    { model: dbcategory },
                    { model: like, attributes: ['id'],
                        include: [
                            { model: User, attributes: ['username'] }
                        ],
                    },
                    { model: blogKeyword, attributes: ['blogId', 'keywordId'],
                        include: [
                            { model: keyword }
                        ]}],
                where: condition, 
                order: [
                    [sortBy, sort]
                ],
                subQuery: false
            })

            const count = await blog.count({where: condition})

            res.status(200).send({
                total: count,
                page: page,
                limit: limit,
                total_page: Math.ceil(count / limit),
                result
            })
        } catch (err) {
            console.log(err);
            res.status(400).send(err)
        }
    },
    createBlog: async (req, res) => {
        try {
            const { title, content, videoURL, country, keywords, category } = req.body

            const checkVerif = await User.findOne({
                where: {
                    id: req.user.id
                }
            })

            if (!checkVerif.isVerif) throw { message: "Account not verified" }
            
            const t = await sequelize.transaction()

            try {
                const result = await blog.create({
                    title, 
                    imgBlog: req.file.filename,
                    content,
                    videoURL,
                    country,
                    UserId: req.user.id,
                    categoryId: +category,
                }, { transaction: t })

                let keys = keywords.split(",")

                await Promise.all(

                    keys.map(async (v, i) => {
                        const [key] = await keyword.findOrCreate({
                            where: { keyword: v },
                            transaction: t 
                        })
                        
                        await blogKeyword.create({
                            blogId: result.id,
                            keywordId: key.id
                        }, { transaction: t})
                    })
                )
                    
                await t.commit()
                res.status(200).send({
                    message: "Blog successfuly created"
                })
            } catch (err) {
                console.log(err);
                await t.rollback()
                throw err
            }

        } catch (err) {
            console.log(err);
            res.status(400).send(err)
        }
    },
    likeBlog: async (req, res) => {
        try {
            const checkIsLiked = await like.findOne({
                where: {
                    UserId: req.user.id,
                    blogId: req.body.blogId
                }
            })

            if(!checkIsLiked) {
                await like.create({
                    blogId: req.body.blogId,
                    UserId: req.user.id,
                })
                res.status(200).send({
                    message: "Blog liked!"
                })
            } else {
                await like.destroy({
                    where: {
                        blogId: req.body.blogId,
                        UserId: req.user.id
                    }
                })
                res.status(200).send({
                    message: "Blog unliked!"
                })
            }
        } catch (err) {
            console.log(err);
            res.status(400).send(err)
        }
    },
    getLikedBlog: async (req, res) => {
        try {
            const page = +req.query.page || 1
            const limit = +req.query.limit || 10
            const sort = req.query.sort || 'DESC'
            const sortBy = req.query.sortBy || `createdAt`
            const result = await like.findAll({
                attributes: ['blogId', 'UserId'],
                limit,
                offset: limit * (page - 1),
                where: {
                    UserId: req.user.id,
                },
                include: [
                    {
                        model: blog, 
                        attributes: ['title', 'content', 'imgBlog', 'createdAt'], 
                        include: [{ model: dbcategory }, { model: User, attributes: ['username', 'imageProfile'] }], 
                        where: {isDeleted: false}
                    }],
                order: [
                    [sortBy, sort]
                ]
            })
            const count = await like.count({
                where: {
                    UserId: req.user.id,
                },
                include: [
                    {
                        model: blog, 
                        attributes: ['title', 'content', 'imgBlog', 'createdAt'], 
                        include: [{ model: dbcategory }, { model: User, attributes: ['username', 'imageProfile'] }], 
                        where: {isDeleted: false}
                    }]
            })
            res.status(200).send({
                total: count,
                page,
                limit,
                total_page: Math.ceil(count / limit),
                result
            })
        } catch (err) {
            console.log(err);
            res.status(400).send(err)
        }
    },
    getUserBlog: async (req, res) => {
        try {
            const page = +req.query.page || 1
            const limit = +req.query.limit || 10
            const sort = req.query.sort || 'DESC'
            const sortBy = req.query.sortBy || `createdAt`
            const result = await blog.findAll({
                limit,
                offset: limit * (page - 1),
                where: {
                    UserId: req.user.id,
                    isDeleted: false
                },
                include: [{ model: User, attributes: ['username', 'imageProfile'] }, { model: dbcategory }],
                order: [
                    [sortBy, sort]
                ]
            })

            const count = await blog.count({
                where: {
                    UserId: req.user.id,
                    isDeleted: false
                }
            })

            res.status(200).send({
                total: count,
                page,
                limit,
                total_page: Math.ceil(count / limit),
                result
            })
        } catch (err) {
            res.status(400).send(err)
        }
    },
    deleteBlog: async (req, res) => {
        try {
            await blog.update({ isDeleted: true },{
                where: {
                    id: req.body.blogId,
                    UserId: req.user.id
                }
            }),

            res.status(200).send({
                message: "Blog deleted!"
            })
        } catch (err) {
            console.log(err);
            res.status(400).send(err)
        }
    },
    getBlogById: async (req, res) => {
        try {
            const result = await blog.findOne({
                where: {
                    id: req.params.blogId,
                    isDeleted: false
                },
                attributes: [
                    "id",
                    "title",
                    "content",
                    "imgBlog",
                    "keywords",
                    "country",
                    "videoURL",
                    [
                      Sequelize.literal(
                        "(SELECT COUNT(*) FROM likeBlogs WHERE likeBlogs.blogId = blog.id)"
                      ),
                      "totalLike",
                    ],
                    "createdAt",
                    "CategoryId",
                    "UserId",
                  ],
                include: [{model: User, attributes: ['username', 'imageProfile']}, {model: dbcategory}, {model: like}]
            })
            
            res.status(200).send({
                result
            })
        } catch (err) {
            res.status(400).send(err)
        }
    },
    getCategory: async (req, res) => {
        try {
            const result = await dbcategory.findAll()

            res.status(200).send({
                result
            })
        } catch (err) {
            res.status(400).send(err)
        }
    }
}