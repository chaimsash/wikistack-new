const Sequelize = require('sequelize');
const db = new Sequelize('postgres://localhost:5432/wikistack-new');
const marked = require('marked');


const Page = db.define('page', {
  title: {
    type: Sequelize.STRING,
    allowNull: false
  },
  urlTitle: {
    type: Sequelize.STRING,
    allowNull: false
  },
  content: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  renderedContent: {
    type: Sequelize.VIRTUAL,
    get: function(){
      return marked(this.content);
    }
  },
  status: {
    type: Sequelize.ENUM('open', 'closed'),
  },
  tags: {
    type: Sequelize.ARRAY(Sequelize.TEXT),
    set: function (value) {

      var arrayOfTags;

      if (typeof value === 'string') {
        arrayOfTags = value.split(',').map(function (s) {
          return s.trim();
        });
        this.setDataValue('tags', arrayOfTags);
      } else {
        this.setDataValue('tags', value);
      }

    }
  },
  date: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  }
}, {
  hooks: {
    beforeValidate: function (page) {
      page.urlTitle = page.title.replace(/[^A-Z0-9]+/ig, "_");
    }
  },
  classMethods: {
    findByTag: function (tag) {
      return Page.findAll({
        where: {
          tags: {
            $overlap: [tag]
          }
        }
      });
    }
  },
  instanceMethods: {
    findSimilar: function(){
      return Page.findAll({
        where: {
          tags: {
            $overlap: this.tags
          },
          id: {
            $ne: this.id
          }
        }
      });
    }
  }
});

const User = db.define('user', {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  }
});

Page.belongsTo(User, {
  as: 'Author'
});

module.exports = {
  db,
  User,
  Page
};
