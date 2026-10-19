import type React from 'react';
import { Box, Container, Skeleton, Stack } from '@mui/material';
import PageHeader from '@components/PageHeader/PageHeader';

interface LoadingProps {
    title?: string;
    description?: string;
    showTable?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ 
    title = "Loading...", 
    description = "Please wait while we load the content", 
    showTable = true 
}) => {
    return (
        <Container sx={{ mb: 3 }}>
            <PageHeader 
                title={title}
                subtitle={description}
                marginBottom={3}
            />
            <Box sx={{ maxWidth: 900, mx: "auto" }}>
                <Box sx={{ 
                    p: 2, 
                    mb: 2, 
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    backgroundColor: 'background.paper'
                }}>
                    <Stack spacing={2}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <Skeleton variant="rectangular" height={56} sx={{ flex: 1 }} />
                            <Skeleton variant="rectangular" height={56} width={200} />
                        </Stack>
                        
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            <Skeleton variant="rounded" width={80} height={32} />
                            <Skeleton variant="rounded" width={100} height={32} />
                            <Skeleton variant="rounded" width={90} height={32} />
                            <Skeleton variant="rounded" width={70} height={32} />
                        </Stack>
                    </Stack>
                </Box>

                {showTable && (
                    <>
                        <Box sx={{ 
                            p: 2, 
                            mb: 1,
                            backgroundColor: 'background.paper',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider'
                        }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Skeleton variant="circular" width={32} height={32} />
                                <Skeleton variant="text" width={150} height={20} />
                                <Skeleton variant="text" width={100} height={20} />
                                <Skeleton variant="text" width={80} height={20} />
                                <Skeleton variant="text" width={60} height={20} />
                            </Stack>
                        </Box>

                        {Array.from({ length: 8 }).map((_, index) => (
                            <Box key={index} sx={{ 
                                p: 2, 
                                mb: 1,
                                backgroundColor: 'background.paper',
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                                opacity: 1 - (index * 0.1) // fade in and out
                            }}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Skeleton variant="circular" width={32} height={32} />
                                    <Box sx={{ flex: 1 }}>
                                        <Skeleton variant="text" width={`${Math.random() * 40 + 60}%`} height={20} />
                                        <Skeleton variant="text" width={`${Math.random() * 60 + 40}%`} height={16} sx={{ mt: 0.5 }} />
                                    </Box>
                                    <Skeleton variant="rounded" width={70} height={24} />
                                    <Skeleton variant="rounded" width={60} height={24} />
                                    <Skeleton variant="text" width={80} height={16} />
                                </Stack>
                            </Box>
                        ))}
                    </>
                )}
            </Box>
        </Container>
    );
};

export default Loading;