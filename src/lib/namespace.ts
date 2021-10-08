import { Type } from './type';

/**
 * Namespace class.
 *
 * @class moxiedoc.Namespace
 */
class Namespace {
  public _types: Type[] = [];
  public _namespaces: Namespace[] = [];
  public _parent?: Namespace;
  public access: string;
  public desc: string;
  public fullName: string;
  public summary: string;

  /**
   * Constructs a new Namespace instance.
   *
   * @constructor
   * @param {Object} data Json structure with member data.
   */
  constructor (data: Record<string, any>) {
    for (const name in data) {
      this[name] = data[name];
    }
  }

  public addChildNamespace(namespace: Namespace) {
    this._namespaces.push(namespace);
    namespace._parent = this;

    return namespace;
  };

  public getParent(): Namespace {
    return this._parent;
  };

  public getNamespaces(): Namespace[] {
    return this._namespaces;
  };

  public addType(type: Type): Type {
    this._types.push(type);

    return type;
  };

  public getTypes(): Type[] {
    return this._types;
  };

  /**
   * Returns an array of the types by the specified type.
   *
   * @method getMembersByType
   * @param {String} typeName Type name to get members by.
   * @return {Array} Array of members of the type MemberInfo.
   */
  public getTypesByType(typeName: string): Type[] {
    const types = [];

    this._types.forEach((type) => {
      if (type.type === typeName) {
        types.push(type);
      }
    });

    return types;
  };

  /**
   * Returns an array of classes.
   *
   * @method getClasses
   * @return {Array} Array of classes of the type Type.
   */
  public getClasses(): Type[] {
    return this.getTypesByType('class');
  };

  /**
   * Returns an array of mixins.
   *
   * @method getMixins
   * @return {Array} Array of mixins of the type Type.
   */
  public getMixins(): Type[] {
    return this.getTypesByType('mixin');
  };

  /**
   * Returns an array of structs.
   *
   * @method getStructs
   * @return {Array} Array of structs of the type Type.
   */
  public getStructs(): Type[] {
    return this.getTypesByType('struct');
  };

  /**
   * Removes all private types from the namespace.
   *
   * @method removePrivates
   */
  public removePrivates(): void {
    this._types = this._types.filter(function (type) {
      return type.access !== 'private';
    });

    this._namespaces = this._namespaces.filter(function (namespace) {
      namespace.removePrivates();

      if (namespace.getTypes().length + namespace.getNamespaces().length === 0) {
        return false;
      }

      return namespace.access !== 'private';
    });
  };

  /**
   * Serializes the Namespace as JSON.
   *
   * @method toJSON
   * @return {Object} JSON object.
   */
  public toJSON(): Record<string, any> {
    const json: Record<string, any> = {
      types: [],
      namespaces: []
    };

    for (const name in this) {
      if (typeof name !== 'function' && name.indexOf('_') !== 0) {
        json[name] = this[name];
      }
    }

    this._types.forEach((type) => {
      json.types.push(type.toJSON());
    });

    this._namespaces.forEach((namespace) => {
      json.namespaces.push(namespace.toJSON());
    });

    return json;
  };
}

export {
  Namespace
};

