class AddPupilPage < SitePrism::Page
  set_url '/pupil-register/pupil/add/'

  element :heading, '.heading-xlarge'
  element :message, '.heading-medium'
  element :first_name, 'input[name="foreName"]'
  element :middle_name, 'input[name="middleNames"]'
  element :last_name, 'input[name="lastName"]'
  element :first_name_alias, 'input[name="foreNameAlias"]'
  element :last_name_alias, 'input[name="lastNameAlias"]'
  element :upn, 'input[name="upn"]'
  element :day, '#dob-day'
  element :month, '#dob-month'
  element :year, '#dob-year'
  element :female, '#gender-female'
  element :male, '#gender-male'
  element :add_pupil, 'button', text: 'Add pupil'
  element :back, 'a', text: 'Cancel'
  element :csrf, 'input[name="_csrf"]', visible: false
  section :phase_banner, PhaseBanner, '.govuk-phase-banner'
  elements :error_messages, '.govuk-error-message'
  section :error_summary, ErrorSummary, "div[data-module='govuk-error-summary']"
  section :reason, ReasonSection, ".show-age-content"

  section :what_is_upn, ".govuk-details" do
    element :toggle, "summary .govuk-details__summary"
    elements :explanatory_text, "p"
    element :more_details, "a[href='https://www.gov.uk/government/publications/unique-pupil-numbers']"
  end

  def enter_details(hash)
    p hash.fetch(:upn, '')
    first_name.set hash.fetch(:first_name, '')
    middle_name.set hash.fetch(:middle_name, '')
    last_name.set hash.fetch(:last_name, '')
    first_name_alias.set hash.fetch(:first_name_alias, '')
    last_name_alias.set hash.fetch(:last_name_alias, '')
    upn.set hash.fetch(:upn, '')
    day.set hash.fetch(:day, '')
    month.set hash.fetch(:month, '')
    year.set hash.fetch(:year, '')
    female.click if hash.fetch(:female, nil)
    male.click if hash.fetch(:male, nil)
  end
end
