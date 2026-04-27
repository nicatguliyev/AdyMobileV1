import {BehaviviorsSubject} from 'rxjs';
import notifee from '@notifee/react-native';

const networkStatus = new BehaviviorsSubject(true); // abunəçilərə həm dəyişiklikləri bildirir, həm də son dəyəri saxlayır.

export const _networkStatus  = networkStatus.asobservable(); // bu, xaricə yalnız oxumaq üçün təqdim edilir, beləliklə digər hissələr yalnız networkStatus-un son dəyərini əldə edə bilər, amma onu dəyişdirə bilməz.

export const changeNetworkStatus = status => { // bu funksiya, şəbəkə vəziyyətində dəyişiklik olduqda çağırılır və yeni vəziyyəti networkStatus BehaviorSubject-ə ötürür.
    networkStatus.next(status);
};

export const setBadgeCount = async count => { // bu funksiya, tətbiqin ikonunda göstərilən bildiriş sayını təyin etmək üçün istifadə olunur. Bu, istifadəçilərə yeni bildirişlərin olduğunu göstərmək üçün faydalıdır.
    await notifee.setBadgeCount(count);
}

