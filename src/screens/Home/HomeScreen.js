import { StyleSheet, View } from 'react-native'
import React, { useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import useAuth from '../../hooks/useAuth'
import { useTheme } from '../../context/ThemeContext'
import StandardHeader from '../../components/StandardHeader'
import TabBar from './components/TabBar'
import MyCirclesTab from './components/MyCirclesTab'
import ForYouTab from './components/ForYouTab'
import useExpiredCircleCleanup from '../../hooks/useExpiredCircleCleanup'



const HomeScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('myCircles')
    const { user } = useAuth()
    const { colors } = useTheme()
    const { cleanupExpiredCircles } = useExpiredCircleCleanup()

    // Trigger cleanup when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            // Run cleanup when user navigates to home screen
            cleanupExpiredCircles();
        }, [cleanupExpiredCircles])
    );

    const tabs = [
        { key: 'myCircles', title: 'My circles' },
        { key: 'forYou', title: 'For you' }
    ]

    const handleCirclePress = (circle) => {
        // Navigate to circle details or chat
        if (navigation) {
            navigation.navigate('Circle', { circleId: circle.id, name: circle.circleName })
        }
    }

    const handleCreateCircle = () => {
        if (navigation) {
            navigation.navigate('CreationForm')
        }
    }

    const handleTabPress = (tabKey) => {
        setActiveTab(tabKey)
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'myCircles':
                return (
                    <MyCirclesTab
                        navigation={navigation}
                        onCirclePress={handleCirclePress}
                    />
                )
            case 'forYou':
                return (
                    <ForYouTab
                        navigation={navigation}
                        onCirclePress={handleCirclePress}
                    />
                )
            default:
                return null
        }
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StandardHeader
                title="Circles"
                rightIcon="add"
                onRightPress={handleCreateCircle}
                navigation={navigation}
            />

            <TabBar
                activeTab={activeTab}
                onTabPress={handleTabPress}
                tabs={tabs}
            />

            {renderTabContent()}
        </View>
    )
}

export default HomeScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
    },
})