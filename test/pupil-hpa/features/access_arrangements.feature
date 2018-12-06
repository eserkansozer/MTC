@access_arrangement_setting @generate_live_pin
Feature: Access Arrangements

  Scenario: Setting page is displayed as per design
    Given I logged in with user with access arrangement 'Audible time alert,Remove on-screen number pad'
    Then I can see setting page as per design
    And I can see following access arrangement
      | access_arrangement_type |
      | Remove number pad       |
      | Time alert              |

  Scenario: Setting page is displayed as per design for Input Assistance access arrangement
    Given I logged in with user with access arrangement 'Input assistance'
    Then I can see setting page for input assistance as per design
    And I can see following access arrangement
      | access_arrangement_type |
      | Input assistance        |

  Scenario: Error message is dispalyed if input assistance first name or last name is not provided
    Given I logged in with user with access arrangement 'Input assistance'
    When I click Next button on setting page
    Then I can see following message for input assistance
      | error_message      |
      | Enter a first name |
      | Enter a last name  |

  Scenario: Setting page is displayed as per design for Question reader access arrangement
    Given I logged in with user with access arrangement 'Question reader'
    Then I can see setting page as per design
    And I can see following access arrangement
      | access_arrangement_type |
      | Question reader         |

  Scenario: Setting page is displayed as per design for Question reader access arrangement
    Given I logged in with user with access arrangement 'Question reader'
    Then I can see setting page as per design
    And I can see following access arrangement
      | access_arrangement_type |
      | Question reader         |

  Scenario: Font size setting page is displayed as per design
    Given I logged in with user with the access arrangement 'Font size'
    Then I should see the font size page matches design
    And I should be taken to the Welcome page once i have chosen a font size

  Scenario: Setting page is displayed as per design for Colour contrast access arrangement
    Given I logged in with user with the access arrangement 'Colour contrast'
    Then I should see the colour contrast page matches design
    And I should be taken to the Welcome page once i have chosen a colour
