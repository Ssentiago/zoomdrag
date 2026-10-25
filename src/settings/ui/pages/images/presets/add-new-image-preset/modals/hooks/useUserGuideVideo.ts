import { useEffect, useMemo, useRef, useState } from 'react';

import { normalizePath, requestUrl } from 'obsidian';

import { useSettingsContext } from '../../../../../../core/SettingsContext';

export const useUserGuideVideo = (): {
    isLoading: boolean;
    videoUrl: string;
} => {
    const { plugin } = useSettingsContext();

    const pluginPath = useMemo(() => plugin.manifest.dir, [plugin]);
    const [isLoading, setIsLoading] = useState(true);
    const [videoUrl, setVideoUrl] = useState('');

    const downloadVideo = async (videoPath: string): Promise<boolean> => {
        try {
            const url =
                'https://raw.githubusercontent.com/Ssentiago/image-zoom-drag/main/assets/videos/find-class.mp4';
            const response = await requestUrl(url);

            if (response.status !== 200) {
                plugin.logger.error(
                    `Error downloading video: ${response.status}`
                );
                return false;
            }

            await plugin.app.vault.adapter.writeBinary(
                videoPath,
                response.arrayBuffer
            );

            return true;
        } catch (err: unknown) {
            plugin.logger.error(`Error downloading video: ${err.message}`);
            return false;
        }
    };

    const loadVideo = async (): Promise<boolean> => {
        const pluginDir = plugin.manifest.dir;

        if (!pluginDir) {
            return false;
        }

        const assetsPath = normalizePath(`${pluginDir}/assets`);
        const videoPath = normalizePath(`${assetsPath}/user-guide-video.mp4`);
        const existsAssetsPath =
            await plugin.app.vault.adapter.exists(assetsPath);
        const existsVideo = await plugin.app.vault.adapter.exists(videoPath);

        !existsAssetsPath && (await plugin.app.vault.adapter.mkdir(assetsPath));

        if (!existsVideo) {
            await downloadVideo(videoPath);
        }

        return plugin.app.vault.adapter.exists(videoPath);
    };

    const videoPath = useRef(
        normalizePath(`${pluginPath}/assets/user-guide-video.mp4`)
    );

    useEffect(() => {
        const fetchVideo = async () => {
            setIsLoading(true);
            try {
                const exists = await loadVideo();
                if (exists) {
                    const arrayBuffer =
                        await plugin.app.vault.adapter.readBinary(
                            videoPath.current
                        );
                    const buffer = Buffer.from(arrayBuffer);
                    const base64 = buffer.toString('base64');
                    setVideoUrl(`data:video/mp4;base64,${base64}`);
                } else {
                    plugin.showNotice('The user guide video is not available.');
                }
            } catch (error) {
                console.error(error);
                plugin.showNotice(
                    'Something went wrong. The video is missing.'
                );
            } finally {
                setIsLoading(false);
            }
        };

        void fetchVideo();
    }, [videoPath]);

    return { isLoading, videoUrl };
};
