const moment = require('moment');
const fs = require('fs');
/* const path = require('path'); */
const async = require('async');
const _ = require('lodash');

/* eslint-disable no-param-reassign */

module.exports = (Dokumente) => {
  Dokumente.upload = (idVertrag, idTyp, ctx, cb) => {
    Dokumente.app.models.User.findById(ctx.req.accessToken.userId, (/* err, userObj */) => {
      const storagePath = Dokumente.app.dataSources.storage.settings.root;
      const contractDataPath = `${storagePath}/${idVertrag}/`;
      fs.exists(contractDataPath, (exists) => {
        if (!exists) {
          fs.mkdirSync(contractDataPath, 755);
        }

        let origFilename = '';

        Dokumente.app.models.DocumentStorage.upload(ctx.req, ctx.res, {
          container: `${idVertrag}`,
          getFilename: (fileInfo) => {
            origFilename = fileInfo.name;
            const parts = origFilename.split('.');
            return `${parts.slice(0, -1).join('.')}-${moment().format('YYYY-MM-DDTHH-mm-ss')}.${parts[parts.length - 1]}`;
          },
        }, (err, fileObj) => {
          if (err) {
            cb(err);
          } else {
            const fileInfo = fileObj.files.file[0]; // TODO: check if files empty
            Dokumente.create({
              datum: moment().toDate(),
              dateiname: origFilename,
              url: fileInfo.name,
              idUser: ctx.req.accessToken.userId,
              idVertrag,
              idTyp,
            }, cb);
          }
        });
      });
    });
  };

  Dokumente.remoteMethod('upload', {
    http: {
      path: '/upload/:idVertrag',
      verb: 'post',
    },
    accepts: [{
      arg: 'idVertrag',
      type: 'Number',
    }, {
      arg: 'idTyp',
      type: 'Number',
      required: false,
    }, {
      arg: 'ctx',
      type: 'object',
      http: { source: 'context' },
    }],
    returns: {
      type: 'Object',
      description: 'Gibt zurück, ob Upload funktioniert hat',
      root: true,
    },
    description: 'Upload von Vertragsdokumenten',
  });

  Dokumente.download = (id, ctx, cb) => {
    Dokumente.findById(id, (err, doc) => {
      if (err) {
        cb(err, null);
        return;
      }
      ctx.res.attachment(doc.dateiname);
      Dokumente.app.models.DocumentStorage.download(`${doc.idVertrag}`, doc.url, ctx.req, ctx.res, cb);
    });
  };

  Dokumente.remoteMethod('download', {
    http: {
      path: '/download/:id',
      verb: 'get',
    },
    accepts: [{
      arg: 'id',
      type: 'Number',
    }, {
      arg: 'ctx',
      type: 'object',
      http: { source: 'context' },
    }],
    description: 'Download von Vertragsdokument',
  });

  Dokumente.beforeRemote('deleteById', (ctx, remoteMethodOutput, next) => {
    let doc;
    Dokumente.findById(ctx.req.params.id)
      .then((foundDocument) => {
        doc = foundDocument;

        return Dokumente.app.models.DocumentStorage.removeFile(`${doc.idVertrag}`, doc.url);
      })
      .then(() => Dokumente.find({ where: { idVertrag: doc.idVertrag, dateiname: doc.dateiname } }))
      .then((docsHistory) => {
        _.remove(docsHistory, doc);

        async.each(docsHistory, (docHistory, callback) => {
          Dokumente.deleteById(docHistory.id)
            .then(() => Dokumente.app.models.DocumentStorage.removeFile(`${docHistory.idVertrag}`, doc.url, callback()))
            .catch((err) => {
              callback(err);
            });
        }, (err) => {
          next(err ? new Error(err) : undefined);
        });
      })
      .catch((err) => {
        next(new Error(err));
      });
  });
};
