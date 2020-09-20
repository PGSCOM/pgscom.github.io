<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'wordpress' );

/** MySQL database username */
define( 'DB_USER', 'root' );

/** MySQL database password */
define( 'DB_PASSWORD', '' );

/** MySQL hostname */
define( 'DB_HOST', 'localhost' );

/** Database Charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The Database Collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         '>jo_=4J=E<HUqfFs1<kDN/x~RjtEn!]dm*:g88Hj[SIcPd-*I,Zm,CJ6w=5G-u)5' );
define( 'SECURE_AUTH_KEY',  'MDwU(ZMDjd~SwZ?vPW&{hq5NOZB,cp+`g-,xTy 5~&)V^_/$%+ieZb|@Zxrwcvy8' );
define( 'LOGGED_IN_KEY',    'UF+gMY=VDvr}d%xz[:Qra!-5>S.ZYov.6rH?|)P7c0*U|FWM=C+ZDIV-m&x0Xwam' );
define( 'NONCE_KEY',        ',T0#x:*;nSFB{!ued)j^`YYwp+yhI[uFDm8P?YB=ghk)P!mbL=|Ei#KiE&,d@ojK' );
define( 'AUTH_SALT',        'ZWBLG6B?s93*Gtqd!7/S7&}C%Pg:X5k/O,?0K8IO$TXWkVg:%e},;jFbowg+,C`L' );
define( 'SECURE_AUTH_SALT', '6NCRgc8uHMs]Fy-vz?:|,=g9~$+Y/`?EZNK:rAO2tca%O0>-~q5m$*0j@CsRulAL' );
define( 'LOGGED_IN_SALT',   '-LJ4o}$/&m=/bg~uc=fA|toKB!YW>hiEN&EgUDQUc=eqsxmQe%*5hPeTu#%x*.g!' );
define( 'NONCE_SALT',       ';IjTsE=Yllq{mr@na^x`cS1~eErXO<4WSJrhUn)0e_n.=Yq0qpKW&T}p_l4N1VPJ' );

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */
define( 'WP_DEBUG', false );

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
