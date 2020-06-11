const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const session = require("express-session");
const connection = require("./database/database");

const categoriesController = require("./categories/CategoriesController");
const articlesController = require("./articles/ArticlesController");
const usersController = require("./users/UsersController");

const Article = require("./articles/Article");
const Category = require("./categories/Category");
const User = require("./users/User");

// View engine
app.set("view engine", "ejs");

// Session
app.use(
	session({
		secret: "qualquercoisa",
		cookie: {
			maxAge: 30000,
		},
		resave: true,
    	saveUninitialized: true
	})
);

// Static
app.use(express.static("public"));

// Body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Connection Database
connection
	.authenticate()
	.then(() => {
		console.log("Conexão feita com sucesso!");
	})
	.catch((error) => {
		console.log(error);
	});

// Rotas
app.use("/", categoriesController);
app.use("/", articlesController);
app.use("/", usersController);

app.use("/session", (req, res) => {
	req.session.treinamento = "Formação Node.js";
	req.session.ano = 2020;
	req.session.email = "dan.castilho@gmail.com";
	req.session.user = {
		username: "danielcastilho",
		email: "dan.castilho@gmail.com",
		id: 10
	}
	res.send("Sessão gerada!");
});

app.use("/leitura", (req, res) => {
	res.json({
		treinamento: req.session.treinamento,
		ano: req.session.ano,
		email: req.session.email,
		user: req.session.user
	});
});

app.get("/", (req, res) => {
	Article.findAll({
		order: [["id", "DESC"]],
		limit: 4,
	}).then((articles) => {
		Category.findAll().then((categories) => {
			res.render("index", { articles: articles, categories: categories });
		});
	});
});

app.get("/:slug", (req, res) => {
	var slug = req.params.slug;
	Article.findOne({
		where: {
			slug: slug,
		},
	})
		.then((article) => {
			if (article != undefined) {
				Category.findAll().then((categories) => {
					res.render("article", {
						article: article,
						categories: categories,
					});
				});
			} else {
				res.redirect("/");
			}
		})
		.catch((error) => {
			res.redirect("/");
		});
});

app.get("/category/:slug", (req, res) => {
	var slug = req.params.slug;
	Category.findOne({
		where: {
			slug: slug,
		},
		include: [{ model: Article }],
	})
		.then((category) => {
			if (category != undefined) {
				Category.findAll().then((categories) => {
					res.render("index", {
						articles: category.articles,
						categories: categories,
					});
				});
			} else {
				res.redirect("/");
			}
		})
		.catch((error) => {
			res.redirect("/");
		});
});

app.listen(3000, () => {
	console.log("O servidor está rodando!");
});
