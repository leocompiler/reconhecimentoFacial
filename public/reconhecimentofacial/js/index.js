document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
    console.log(navigator.camera);
    var permissions = cordova.plugins.permissions;

    permissions.requestPermission(permissions.CAMERA, success, error);
    function error() {
        console.warn('Camera permission is not turned on');
    }

    function success(status) {
        if (!status.hasPermission) error();
    }


}