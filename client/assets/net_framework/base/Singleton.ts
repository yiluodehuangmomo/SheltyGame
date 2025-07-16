/**
 * 单例模板
 */
export function Singleton<E>() {
    class SingletonE {
        protected constructor() {}
        private static _instance: SingletonE = null!;
        public static get Ins(): E {
            if (SingletonE._instance == null) {
                SingletonE._instance = new this();
            }
            return SingletonE._instance as E;
        }
        public static clearInstance() {
            SingletonE._instance = null!;
        }
    }

    return SingletonE;
}
