import { StyleSheet, View } from 'react-native'
import React, { useState } from 'react'
import useAuth from '../../hooks/useAuth'
import useJoinedCircleIds from '../../hooks/useJoinedCircleIds'
import { useTheme } from '../../context/ThemeContext'
import StandardHeader from '../../components/StandardHeader'
import TabBar from './components/TabBar'
import MyCirclesTab from './components/MyCirclesTab'
import ForYouTab from './components/ForYouTab'



const HomeScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('myCircles')
    // Tabs stay mounted after their first visit, so switching keeps loaded pages and scroll position.
    const [visitedTabs, setVisitedTabs] = useState({ myCircles: true })
    const { user } = useAuth()
    const { colors } = useTheme()
    const joined = useJoinedCircleIds(user?.uid)

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
        setVisitedTabs((visited) => ({ ...visited, [tabKey]: true }))
    }

    const renderTab = (key) => {
        switch (key) {
            case 'myCircles':
                return (
                    <MyCirclesTab
                        onCirclePress={handleCirclePress}
                        joinedIds={joined.ids}
                        joinedLoaded={joined.loaded}
                        joinedError={joined.error}
                        refreshJoined={joined.refresh}
                    />
                )
            case 'forYou':
                return (
                    <ForYouTab
                        onCirclePress={handleCirclePress}
                        joinedIds={joined.ids}
                        refreshJoined={joined.refresh}
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

            {tabs.map(({ key }) => visitedTabs[key] && (
                <View key={key} style={[styles.tab, activeTab !== key && styles.hidden]}>
                    {renderTab(key)}
                </View>
            ))}
        </View>
    )
}

export default HomeScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
    },
    tab: {
        flex: 1,
    },
    hidden: {
        display: 'none',
    },
})
