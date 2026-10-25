import fs from 'fs';
import type { Plugin } from 'rollup';
import * as sass from 'sass';

export function buildSass(): Plugin {
    return {
        name: 'build-sass',
        buildStart() {
            const compileSass = () => {
                try {
                    const result = sass.compile('styles.scss', {
                        style:
                            process.env.NODE_ENV === 'production'
                                ? 'compressed'
                                : 'expanded',
                    });

                    fs.writeFileSync('styles.css', result.css);
                    console.log('SCSS compiled successfully');
                } catch (error) {
                    console.error('Failed to compile SCSS:', error);
                }
            };

            compileSass();
        },
    };
}
