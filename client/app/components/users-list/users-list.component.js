import * as angular from 'angular';
import template from './users-list.template.html';

class UsersListCtrl {
  constructor($uibModal, Userlist, User, Role, NgTableParams) {
    Object.assign(this, { $uibModal, Userlist, User, Role, NgTableParams });
    this.users = {};
  }

  $onInit() {
    this.roleOpts = this.Role.find().$promise
    .then((role) => {
      role.forEach((currentValue) => {
        currentValue.title = currentValue.description; // eslint-disable-line no-param-reassign
        delete currentValue.description; // eslint-disable-line no-param-reassign
      });

      return role;
    });

    this.updateUserCount();

    this.tableParams = new this.NgTableParams({
      sorting: {
        nachname: 'asc',
        vorname: 'asc',
        username: 'asc',
      },
    }, {
      getData: (params) => {
        const filter = angular.copy(this.tableParams.filter());

        let role = -1;
        if ({}.hasOwnProperty.call(filter, 'role') && filter.role !== '') {
          role = filter.role; // eslint-disable-line prefer-destructuring
          delete filter.role;
        }

        Object.keys(filter).map((i) => {
          if (angular.isNumber(filter[i])) {
            // do nothing;
          } else if (filter[i].length > 0) {
            filter[i] = { like: `%${filter[i]}%` };
          } else {
            delete filter[i];
          }

          return i;
        });

        const paramsSorting = this.tableParams.sorting();
        const sorting = Object.keys(paramsSorting).map(key => `${key} ${paramsSorting[key].toUpperCase()}`);

        return this.Userlist.find({
          filter: {
            order: sorting,
            where: filter,
          },
        }).$promise.then((values) => {
          if (role !== -1) {
            values = values.filter(n => n.hasOwnProperty.call(n, 'role') && n.role.id === role); // eslint-disable-line no-param-reassign
          }

          params.total(values.length);
          return values.slice((this.tableParams.page() - 1) * this.tableParams.count(), ((this.tableParams.page() - 1) * this.tableParams.count()) + this.tableParams.count()); // eslint-disable-line max-len
        });
      },
    });
  }

  updateUserCount() {
    this.User.count((userCount) => {
      this.User.getCurrent((currentUser) => {
        this.noNewUsers = currentUser.kunde.maxusers - userCount.count <= 0;
      });
    });
  }

  editUser(user) {
    const modalInstance = this.$uibModal.open({
      animation: true,
      component: 'userEdit',
      resolve: {
        user: () => user,
      },
    });

    modalInstance.result.then(() => {
      this.updateUserCount();
      this.tableParams.reload();
      this.user = this.User.getCurrent();
    }, () => {
      // $log.info('Modal dismissed at: ' + new Date());
    });
  }

  removeUser(user) {
    const modalInstance = this.$uibModal.open({
      animation: true,
      component: 'userDestroy',
      resolve: {
        user: () => user,
      },
    });

    modalInstance.result.then((result) => {
      this.User.destroyById({
        id: result.id,
      }, () => {
        this.updateUserCount();
        this.tableParams.reload();
      }, (httpResponse) => {
        console.error('error', httpResponse); // eslint-disable-line no-console
      });
    }, () => {
      // $log.info('Modal dismissed at: ' + new Date());
    });
  }

  lock(user) {
    const modalInstance = this.$uibModal.open({
      component: 'userLock',
      resolve: {
        user: () => user,
      },
    });

    modalInstance.result.then(() => {
      this.tableParams.reload();
    }, () => {
      // $log.info('Modal dismissed at: ' + new Date());
    });
  }

  unlock(user) {
    const modalInstance = this.$uibModal.open({
      animation: true,
      component: 'userUnlock',
      resolve: {
        user: () => user,
      },
    });

    modalInstance.result.then(() => {
      this.tableParams.reload();
    }, () => {
      // $log.info('Modal dismissed at: ' + new Date());
    });
  }
}

angular.module('usersList')

.component('usersList', {
  template,
  controller: UsersListCtrl,
});
