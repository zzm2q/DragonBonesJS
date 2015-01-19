/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/// <reference path="../geom/Matrix.ts"/>
/// <reference path="../model/DBTransform.ts"/>
module dragonBones {

	export class DBObject{
		public name:string;
		
		/**
		 * An object that can contain any user extra data.
		 */
		public userData:any;
		
		/**
		 * 
		 */
		public inheritRotation:boolean;
		
		/**
		 * 
		 */
		public inheritScale:boolean;

        /**
         *
         */
        public inheritTranslation:boolean;

        /** @private */
        public _global:DBTransform;
		/** @private */
		public _globalTransformMatrix:Matrix;

        public static _tempParentGlobalTransformMatrix:Matrix = new Matrix();
        public static _tempParentGlobalTransform:DBTransform = new DBTransform();

        /**
		 * This DBObject instance global transform instance.
		 * @see dragonBones.objects.DBTransform
		 */
		public get global():DBTransform{
			return this._global;
		}
		
		/** @private */
		public _origin:DBTransform;
		/**
		 * This DBObject instance related to parent transform instance.
		 * @see dragonBones.objects.DBTransform
		 */
		public get origin():DBTransform{
			return this._origin;
		}
		
		/** @private */
		public _offset:DBTransform;
		/**
		 * This DBObject instance offset transform instance (For manually control).
		 * @see dragonBones.objects.DBTransform
		 */
		public get offset():DBTransform{
			return this._offset;
		}
		
		/** @private */
		public _visible:boolean;
		
		/** @private */
		public _armature:Armature;
		/**
		 * The armature this DBObject instance belongs to.
		 */
		public get armature():Armature{
			return this._armature;
		}
		/** @private */
		public _setArmature(value:Armature):void{
			this._armature = value;
		}
		
		/** @private */
		public _parent:Bone;
		/**
		 * Indicates the Bone instance that directly contains this DBObject instance if any.
		 */
		public get parent():Bone{
			return this._parent;
		}
		/** @private */
		public _setParent(value:Bone):void{
			this._parent = value;
		}
		
		public constructor(){
			this._globalTransformMatrix = new Matrix();
			
			this._global = new DBTransform();
			this._origin = new DBTransform();
			this._offset = new DBTransform();
			this._offset.scaleX = this._offset.scaleY = 1;
			
			this._visible = true;
			
			this._armature = null;
			this._parent = null;
			
			this.userData = null;

            this.inheritRotation = true;
            this.inheritScale = true;
            this.inheritTranslation = true;
		}
		
		/**
		 * Cleans up any resources used by this DBObject instance.
		 */
		public dispose():void{
			this.userData = null;
			
			this._globalTransformMatrix = null;
			this._global = null;
			this._origin = null;
			this._offset = null;
			
			this._armature = null;
			this._parent = null;
		}

        public _calculateRelativeParentTransform():void
        {

        }

        public _calculateParentTransform():any
        {
            if(this.parent && (this.inheritTranslation || this.inheritRotation || this.inheritScale))
            {
                var parentGlobalTransform:DBTransform = this._parent._globalTransformForChild;
                var parentGlobalTransformMatrix:Matrix = this._parent._globalTransformMatrixForChild;

                if(!this.inheritTranslation || !this.inheritRotation || !this.inheritScale)
                {
                    parentGlobalTransform = DBObject._tempParentGlobalTransform;
                    parentGlobalTransform.copy(this._parent._globalTransformForChild);
                    if(!this.inheritTranslation)
                    {
                        parentGlobalTransform.x = 0;
                        parentGlobalTransform.y = 0;
                    }
                    if(!this.inheritScale)
                    {
                        parentGlobalTransform.scaleX = 1;
                        parentGlobalTransform.scaleY = 1;
                    }
                    if(!this.inheritRotation)
                    {
                        parentGlobalTransform.skewX = 0;
                        parentGlobalTransform.skewY = 0;
                    }

                    parentGlobalTransformMatrix = DBObject._tempParentGlobalTransformMatrix;
                    TransformUtil.transformToMatrix(parentGlobalTransform, parentGlobalTransformMatrix, true);
                }
                return {parentGlobalTransform:parentGlobalTransform, parentGlobalTransformMatrix:parentGlobalTransformMatrix};
            }
            return null;
        }

        public _updateGlobal():any {
            this._calculateRelativeParentTransform();
            TransformUtil.transformToMatrix(this._global, this._globalTransformMatrix, true);

            var output:any = this._calculateParentTransform();
            if (output) {
                this._globalTransformMatrix.concat(output.parentGlobalTransformMatrix);
                TransformUtil.matrixToTransform(this._globalTransformMatrix, this._global, this._global.scaleX * output.parentGlobalTransform.scaleX >= 0, this._global.scaleY * output.parentGlobalTransform.scaleY >= 0);
            }
            return output;
        }
	}
}